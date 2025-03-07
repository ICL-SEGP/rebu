import { processAndUploadFile, processFile } from "@/lib/api/aws";
import humps from "humps";

export enum Role {
  AFFILIATE = "affiliate",
  USER = "user",
  ADMIN = "admin",
  ALL = "all",
}

export enum OrderStatus {
  PENDING = "pending",
  COMPLETED = "completed",
  CANCELED = "cancelled",
  ALL = "all",
}

export enum OfferStatus {
  EXPIRED = "expired",
  ACTIVE = "active",
  SCHEDULED = "scheduled",
  ALL = "all",
}

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  tokenBalance: number;
  role: Role;
  orders: Order[];
  solanaPubKey: string;
  dateJoined: Date;
}

export type UserBalance = {
  token_balance: number;
  locked_tokens: number;
  rescinded_token: number;
  lastUpdated: Date;
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
  user: User;
  totalRebateAmount: string;
  status: OrderStatus;
  orderDate: Date;
  offers: Offer[];
}

export interface Offer {
  id: number;
  affiliateId: number;
  itemCost: number;
  rebatePercentage: number;
  desc: string;
  status: OfferStatus;
  offerStart: Date;
  offerEnd: Date;
  affiliateLink: string;
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
  lastName: string;
  email: string;
  password: string;
};

export enum ProductStatus {
  ACTIVE = "active",
  SCHEDULED = "scheduled",
  SOLD_OUT = "sold_out",
  EXPIRED = "expired",
}

export interface Product {
  id: number;
  name: string;
  desc: string;
  price: number;
  imageUrls: string[];
  fileUrl: string;
  fileType: string; // e.g., "pdf", "mp3", "zip"
  category: Category;
  status: ProductStatus;
  createdAt: Date;
  sellerId: number; // Affiliates are sellers
  reviews: Review[];
  sellerPubKey: string;
}

export type Category = {
  name: string;
  imageUrl: string;
};

export interface Review {
  id: number;
  userId: number;
  productId: number;
  rating: number;
  comment: string;
  createdAt: Date;
}

export interface Purchase {
  id: number;
  buyerId: number;
  sellerId: number; // Track with seller fulfilled the order
  productId: number;
  totalAmount: number;
  orderDate: Date;
  status: OrderStatus;
}

export interface Upload {
  type: string;
  metadata?: Object;
  url: string;
  key: string;
}

// Parsing functions
// TODO: remember to use humps to cammelize keys

export function toUser(user: any): User {
  user = humps.camelizeKeys(user);

  user.id = Number(user.id);

  user.tokenBalance = parseFloat(user.tokenBalance).toFixed(2);
  user.dateJoined = new Date(user.dateJoined);
  user.orders = user.orders?.map((order: any) => toOrder(order));

  return user;
}

export function toAffiliate(affiliate: any): Affiliate {}

export function toOrder(order: any): Order {
  order = humps.camelizeKeys(order);

  order.id = Number(order.id);
  order.totalRebateAmount = parseFloat(order.totalRebateAmount).toFixed(2);
  order.orderDate = new Date(order.orderDate);
  order.offers = order.offers?.map((offer: any) => toOffer(offer)) || [];
  order.user = order.user ? toUser(order.user) : null;

  switch (order.status) {
    case "pending":
      order.status = OrderStatus.PENDING;
      break;
    case "completed":
      order.status = OrderStatus.COMPLETED;
      break;
    case "canceled":
      order.status = OrderStatus.CANCELED;
      break;
  }

  return order;
}

export function toOfferIds(offers: Offer[]) {
  return offers.map((offer) => offer.id);
}

export function toOffer(offer: any): Offer {
  offer = humps.camelizeKeys(offer);

  offer.id = Number(offer.id);
  offer.rebatePercentage = parseFloat(offer.rebatePercentage).toFixed(2);
  offer.offerStart = new Date(offer.offerStart);
  offer.offerEnd = new Date(offer.offerEnd);

  return offer;
}

export function toCategory(category: any) {
  return humps.camelizeKeys(category);
}

export function toProduct(product: any) {
  product = humps.camelizeKeys(product);

  product.id = Number(product.id);
  product.price = parseFloat(product.price);
  product.createdAt = new Date(product.createdAt);
  product.category = product.category ? toCategory(product.category) : null; // Assuming toCategory exists
  product.reviews =
    product.reviews?.map((review: any) => toReview(review)) || []; // Assuming toReview exists
  product.sellerId = Number(product.sellerId);

  switch (product.status) {
    case "active":
      product.status = ProductStatus.ACTIVE;
      break;
    case "scheduled":
      product.status = ProductStatus.SCHEDULED;
      break;
    case "sold_out":
      product.status = ProductStatus.SOLD_OUT;
      break;
    case "expired":
      product.status = ProductStatus.EXPIRED;
      break;
    default:
      product.status = ProductStatus.ACTIVE; // Default to active if unknown
      break;
  }

  return product as Product;
}

export function toUserBalance(balance: any): UserBalance {}

export function toAffiliateBalance(balance: any): AffiliateBalance {}

export function toAffiliateMonthlyStat(stat: any): AffiliateMonthlyStat {}

export function toAdminBalance(balance: any): AdminBalance {}

export function toAdminMonthlyStat(stat: any): AdminMonthlyStat {}
