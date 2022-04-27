export interface IUser {
  name: string;
  email: string;
}

export interface ITemplate {
  id: number;
  category_id: number;
  content: string;
  whatsapp_approved: boolean;
}

export interface ITemplateCategory {
  id: number;
  display_name: string;
  templates: ITemplate[];
}

export interface IConfigurationInfo {
  companyNameShort: string;
  companyNameLong: string;
  welcomeKnownContact: string;
  welcomeUnknownContact: string;
  agentBusyAnswer: string;
  agentNotFoundAnswer: string;
}

export interface IConfiguration {
  id: number;
  info: IConfigurationInfo;
  updated_by: string;
}
export interface IClaim {
  id: number;
  user: string;
  started_at: Date;
  ended_at: Date;
}