defmodule RebuWebApiWeb.PurchaseController do
  use RebuWebApiWeb, :controller
  alias RebuWebApi.SolanaApi
  alias RebuWebApi.Accounts.AccountChangesetHelpers
  alias RebuWebApi.Solana
  alias RebuWebApi.Accounts.{Affiliate, User}
  alias RebuWebApi.Accounts
  alias RebuWebApi.Marketplace

  @affiliate_fee 0.05

  def create(conn, %{"purchase" => purchase_params}) do
    dbg(purchase_params)
    user = Guardian.Plug.current_resource(conn)

    product = Marketplace.get_product!(purchase_params["product_id"])

    to_seller = Decimal.mult(product.price, Decimal.from_float(1 - @affiliate_fee))

    {:ok, {}} =
      Solana.mint_user(purchase_params["seller"]["solana_pub_key"], Decimal.to_float(to_seller))

    case user do




      %User{} ->
        %Affiliate{solana_pub_key: solana_pub_key} = Accounts.get_affiliate!(user.affiliate_id)
        fee = Decimal.mult(product.price, Decimal.from_float(1 - @affiliate_fee))
        {:ok, {}} = Solana.mint_user(solana_pub_key, Decimal.to_float(fee))

      _ ->
        nil
    end

    params = %{
      buyer_id: user.id,
      buyer_type: user.role,
      seller_id: purchase_params["seller"]["id"],
      seller_type: purchase_params["seller"]["role"],
      product_id: product.id,
      total_amount: purchase_params["amount"],
      purchase_date: Timex.now(),
      status: :delivered,
      product: product
    }

    {:ok, purchase} = Marketplace.create_purchase(params)

    dbg(purchase)

    {:ok, {}} = Solana.verify_purchase(user.solana_pub_key, product.id)

    RebuWebApi.Mailer.send_email(RebuWebApi.Emails.send_purchase_email(user, purchase))

    conn
    |> render("purchase.json", purchase: purchase)
  end

  def history(conn, _params) do
    user = Guardian.Plug.current_resource(conn)
    purchases = Marketplace.get_purchases_by_user(user.id)

    conn
    |> render("purchase.json", purchases: purchases)
  end

  # def update(conn, %{"id" => id, "purchase" => purchase_params}) do
  #   purchase = Marketplace.get_purchase!(id)
  #   category = Marketplace.get_category_by_name(purchase_params["category"])

  #   purchase_params =
  #     Map.merge(purchase_params, %{
  #       "category" => category
  #     })

  #   {:ok, purchase} = Marketplace.update_purchase(purchase, purchase_params)

  #   conn
  #   |> render("purchase.json", purchase: purchase)
  # end

  # def get(conn, _params) do
  #   user = Guardian.Plug.current_resource(conn)
  #   purchases = Marketplace.get_purchases_by_user(user)

  #   conn
  #   |> render("purchase.json", purchases: purchases)
  # end

  # def get_by_id(conn, %{"id" => id}) do
  #   purchase = Marketplace.get_purchase!(id)

  #   conn
  #   |> render("purchase.json", purchase: purchase)
  # end

  # def get_all(conn, _params) do
  #   purchases = Marketplace.list_purchases()

  #   conn
  #   |> render("purchase.json", purchases: purchases)
  # end
end
