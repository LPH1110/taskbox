import axios from "axios";
import { prisma } from "../../lib/prisma";
import { encrypt } from "../../utils/encryption";
import { env } from "../../config/env";
import { Logger } from "../../utils/logger";

interface GitHubAccessTokenResponse {
  access_token: string;
  token_type: string;
  scope: string;
}

interface GitHubUserResponse {
  id: number;
  login: string;
}

export class GitHubService {
  /**
   * Exchanges an OAuth code for an access token
   */
  async exchangeCodeForToken(code: string): Promise<string> {
    const clientId = env.GITHUB_CLIENT_ID || process.env.GITHUB_CLIENT_ID;
    const clientSecret = env.GITHUB_CLIENT_SECRET || process.env.GITHUB_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      throw new Error("GitHub Client ID or Secret is missing in environment variables");
    }

    const response = await axios.post<GitHubAccessTokenResponse>(
      "https://github.com/login/oauth/access_token",
      {
        client_id: clientId,
        client_secret: clientSecret,
        code,
      },
      {
        headers: {
          Accept: "application/json",
        },
      }
    );

    if (!response.data || !response.data.access_token) {
      throw new Error("Failed to exchange GitHub code for access token");
    }

    return response.data.access_token;
  }

  /**
   * Fetches the authenticated user's profile from GitHub
   */
  async getGitHubUserProfile(accessToken: string): Promise<GitHubUserResponse> {
    const response = await axios.get<GitHubUserResponse>("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/vnd.github.v3+json",
      },
    });

    if (!response.data || !response.data.id) {
      throw new Error("Failed to fetch GitHub user profile");
    }

    return response.data;
  }

  /**
   * Links the GitHub account to the Taskbox user
   */
  async linkGitHubAccount(userId: string, code: string): Promise<void> {
    const accessToken = await this.exchangeCodeForToken(code);
    const githubUser = await this.getGitHubUserProfile(accessToken);

    const encryptedToken = encrypt(accessToken);

    // Upsert the GitHub account link
    await prisma.userGitHubAccount.upsert({
      where: { user_id: userId },
      update: {
        github_user_id: githubUser.id,
        github_username: githubUser.login,
        access_token: encryptedToken,
      },
      create: {
        user_id: userId,
        github_user_id: githubUser.id,
        github_username: githubUser.login,
        access_token: encryptedToken,
      },
    });

    Logger.info("GitHubService", `Successfully linked GitHub account ${githubUser.login} to user ${userId}`);
  }

  /**
   * Unlinks the GitHub account from the Taskbox user
   */
  async unlinkGitHubAccount(userId: string): Promise<void> {
    try {
      await prisma.userGitHubAccount.delete({
        where: { user_id: userId },
      });
      Logger.info("GitHubService", `Successfully unlinked GitHub account from user ${userId}`);
    } catch (error) {
      // Ignore error if account doesn't exist
    }
  }

  /**
   * Checks if a user has a linked GitHub account
   */
  async hasLinkedAccount(userId: string): Promise<boolean> {
    const account = await prisma.userGitHubAccount.findUnique({
      where: { user_id: userId },
      select: { id: true },
    });
    return !!account;
  }
}

export const githubService = new GitHubService();
