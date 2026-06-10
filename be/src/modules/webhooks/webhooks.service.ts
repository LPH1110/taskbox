import { GitHubWebhookStrategy, WebhookResult } from "./strategies/webhook-event.strategy";
import { PullRequestStrategy } from "./strategies/pull-request.strategy";

export class WebhookService {
  private strategies: Record<string, GitHubWebhookStrategy> = {};

  constructor() {
    this.strategies["pull_request"] = new PullRequestStrategy();
  }

  async processGitHubEvent(event: string, payload: any): Promise<WebhookResult> {
    const strategy = this.strategies[event];
    if (!strategy) {
      return { 
        success: true, 
        statusCode: 200, 
        message: `Ignored event: ${event}` 
      };
    }
    
    return await strategy.handle(payload);
  }
}

export const webhookService = new WebhookService();
