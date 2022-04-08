export interface IUser {
  name: string;
  email: string;
}

export interface ITemplate {
  id: number;
  category_id: number;
  content: string;
  whatsAppApproved: boolean;
}

export interface ITemplateCategory {
  id: number;
  display_name: string;
  templates: ITemplate[];
}