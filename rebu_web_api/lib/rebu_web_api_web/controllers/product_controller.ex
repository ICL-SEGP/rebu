defmodule RebuWebApiWeb.ProductController do
  use RebuWebApiWeb, :controller
  alias RebuWebApi.Accounts.{Affiliate, User}
  alias RebuWebApi.Marketplace
  alias RebuWebApi.Solana

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

    case Marketplace.create_product(product_params) do
      {:ok, product} ->
        Solana.make_listing(product.id, 5, Decimal.to_float(product.price))

        conn
        # Set status to 201 Created
        |> put_status(:created)
        |> render("product.json", product: product)
    end
  end

  def update(conn, %{"id" => id, "product" => product_params}) do
    product = Marketplace.get_product!(id)
    category = Marketplace.get_category_by_name(product_params["category"])

    product_params =
      Map.merge(product_params, %{
        "category" => category
      })

    {:ok, product} = Marketplace.update_product(product, product_params)

    conn
    |> render("product.json", product: product)
  end

  def get(conn, _params) do
    user = Guardian.Plug.current_resource(conn)
    products = Marketplace.get_products_by_user(user)

    dbg(products)

    conn
    |> render("product.json", products: products)
  end

  def get_by_id(conn, %{"id" => id}) do
    product = Marketplace.get_product!(id)

    conn
    |> render("product.json", product: product)
  end

  def get_all(conn, _params) do
    products = Marketplace.list_products()

    dbg(products)

    conn
    |> render("product.json", products: products)
  end
end
