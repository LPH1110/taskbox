export interface WebhookResult {
  success: boolean;
  statusCode: number;
  message?: string;
  error?: string;
  data?: any;
}

export interface GitHubWebhookStrategy {
  handle(payload: any): Promise<WebhookResult>;
}
