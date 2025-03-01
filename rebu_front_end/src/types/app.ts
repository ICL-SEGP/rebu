export enum Role {
  AFFILIATE = "affiliate",
  USER = "user",
  ADMIN = "admin",
}

export enum OrderStatus {
  PENDING = "pending",
  COMPLETED = "completed",
  CANCELED = "canceled",
}

export enum OfferStatus {
  EXPIRED = "expired",
  ACTIVE = "active",
  SCHEDULED = "scheduled",
}

export interface User {
  id: number;
  firstName: string;
  LastName: string;
  email: string;
  balance: UserBalance;
  role: Role;
  orderIds: number;
}

export type UserBalance = {
  token_balance: number;
  locked_tokens: number;
  rescinded_token: number;
  last_updated: Date;
};

export interface Affiliate extends User {
  revenue: number;
  role: Role;
  offerIds: number[];
}

export type AffiliateBalance = {
  token_balance: number;
  last_updated: Date;
};

export interface Order {
  id: number;
  userId: number;
  totalRebateAmount: number;
  status: OrderStatus;
  orderDate: Date;
  offerIds: number[];
}

export interface Offer {
  id: number;
  affiliateId: number;
  itemCost: number;
  description: string;
  offerStatus: OfferStatus;
  offer_start: Date;
  Offer_end: Date;
  affiliate_link: string;
  orderIds: number[];
}

enum Month {
  January = "January",
  February = "February",
  March = "March",
  April = "April",
  May = "May",
  June = "June",
  July = "July",
  August = "August",
  September = "September",
  October = "October",
  November = "November",
  December = "December",
}

export interface AffiliateMonthlyStat {
  month: Month;
  completedOrders: number;
  refundedOrders: Number;
  rebatesMinted: number;
  tokensCancelled: number;
}

export interface AdminMonthlyStat {
  month: Month;
  completedOrders: number;
  refundedOrders: Number;
  rebatesMinted: number;
  tokensCancelled: number;
}

export type AdminBalance = {
  token_balance: number;
  last_updated: Date;
};

export type Credentials = {
  firstName: string;
  email: string;
  password: string;
}

// Parsing functions
// TODO: remember to use humps to cammelize keys

export function toUser(user: any): User {}

export function toAffiliate(affiliate: any): Affiliate {}

export function toOrder(order: any): Order {}

export function toOffer(offer: any): Offer {}

export function toUserBalance(balance: any): UserBalance {}

export function toAffiliateBalance(balance: any): AffiliateBalance {}

export function toAffiliateMonthlyStat(stat: any): AffiliateMonthlyStat {}

export function toAdminBalance(balance: any): AdminBalance {}

export function toAdminMonthlyStat(stat: any): AdminMonthlyStat {}
