defmodule RebuWebApiWeb.PurchaseController do
  use RebuWebApiWeb, :controller
  alias RebuWebApi.Accounts.{Affiliate, User}
  alias RebuWebApi.Marketplace

  def make(conn, %{"purchase" => purchase_params}) do
   dbg(purchase_params)
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
