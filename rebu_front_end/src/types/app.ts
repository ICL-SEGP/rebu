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
  token_balance: number;
  role: Role;
  orderIds: number;
  solanaPubKey: string;
}

export type UserBalance = {
  token_balance: number;
  locked_tokens: number;
  rescinded_token: number;
  last_updated: Date;
};

export interface Affiliate extends User {
  revenue: number;
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
  desc: string;
  status: OfferStatus;
  offer_start: Date;
  offer_end: Date;
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

export type Credentials = {
  firstName: string;
  email: string;
  password: string;
}

export enum MarketplaceRole {
  SELLER = "seller",
  BUYER = "buyer",
}

export enum ProductStatus {
  ACTIVE = "active",
  SOLD_OUT = "sold_out",
  ARCHIVED = "archived",
}

export interface MarketplaceUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  token_balance: number; // Buyers use rebated tokens
  role: Role; // AFFILIATE or USER
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  status: "ACTIVE" | "INACTIVE";
  createdAt: Date;
  sellerId: number; // Affiliates are sellers
  reviews: Review[];
}

export interface Review {
  id: string;
  userId: number;
  productId: string;
  rating: number;
  comment: string;
  createdAt: Date;
}

export interface MarketplaceOrder {
  id: string;
  buyerId: number; // Buyers can be Users or Affiliates
  productId: string;
  totalAmount: number;
  orderDate: Date;
  status: OrderStatus;
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
