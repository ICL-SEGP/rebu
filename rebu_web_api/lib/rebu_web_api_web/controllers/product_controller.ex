defmodule RebuWebApiWeb.ProductController do
  use RebuWebApiWeb, :controller
  alias RebuWebApi.Accounts.{Affiliate, User}
  alias RebuWebApi.Marketplace

  def create(conn, %{"product" => product_params}) do
    seller = Guardian.Plug.current_resource(conn)

    seller_type =
      case seller do
        %Affiliate{} -> "affiliate"
        %User{} -> "user"
      end

    seller_id = seller.id

    category = Marketplace.get_category_by_name(product_params["category"])

    product_params =
      Map.merge(product_params, %{
        "seller_id" => seller_id,
        "seller_type" => seller_type,
        "category" => category
      })

    {:ok, product} = Marketplace.create_product(product_params)

    conn
    |> render("product.json", product: product)
  end

  def get(conn, _params) do
    user = Guardian.Plug.current_resource(conn)
    products = Marketplace.get_products_by_user(user)

    conn
    |> render("product.json", products: products)
  end
end
