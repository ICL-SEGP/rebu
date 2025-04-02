defmodule RebuWebApiWeb.ReviewController do
  use RebuWebApiWeb, :controller
  # alias RebuWebApi.Accounts.{Affiliate, User}
  alias RebuWebApi.Marketplace
  alias RebuWebApi.Accounts.{Affiliate, User}

  def create(conn, %{"review" => review_params}) do
    reviewer = Guardian.Plug.current_resource(conn)

    product = Marketplace.get_product!(review_params["product_id"])

    review_params =
      Map.merge(review_params, %{
        "reviewer_id" => reviewer.id,
        "reviewer_type" => reviewer.role,
        "product" => product
      })

    dbg(review_params)

    {:ok, review} = Marketplace.create_review(review_params)

    conn
    |> render("review.json", review: review)
  end

  def update(conn, %{"id" => id, "review" => review_params}) do
    review = Marketplace.get_review!(id)
    product = Marketplace.get_product!(review_params["product_id"])

    review_params =
      Map.merge(review_params, %{
        "product" => product
      })

    {:ok, review} = Marketplace.update_review(review, review_params)

    conn
    |> render("review.json", review: review)
  end

  def get_reviews_for_product(conn, %{"id" => product_id}) do
    reviews = Marketplace.get_reviews_for_product(product_id)

    conn
    |> render("review.json", %{reviews: reviews})
  end

  def delete(conn, %{"id" => id}) do
    review = Marketplace.get_review!(id)
    Marketplace.delete_review(review)

    conn
    |> json(%{message: "deleted review successfully."})
  end
end
