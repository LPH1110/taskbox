export interface GitHubPullRequestPayload {
  action: "opened" | "closed" | "reopened" | string;
  pull_request: {
    title: string;
    body: string | null;
    merged?: boolean;
    head: {
      ref: string;
    };
    user: {
      id: number;
      login: string;
    };
  };
  repository: {
    full_name: string;
  };
}

export interface ParsedTaskReference {
  taskId: string;
  keyword: string;
}
