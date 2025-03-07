defmodule RebuWebApiWeb.CategoryController do
  use RebuWebApiWeb, :controller
  # alias RebuWebApi.Accounts.{Affiliate, User}
  alias RebuWebApi.Marketplace

  def create(conn, %{"category" => category_params}) do
    dbg(category_params)

    {:ok, category} = Marketplace.create_category(category_params)

    conn
    |> render("category.json", category: category)
  end

  def get(conn, _params) do
    categories = Marketplace.list_categories()

    conn
    |> render("category.json", %{categories: categories})
  end
end
