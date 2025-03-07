defmodule RebuWebApiWeb.ReviewController do
  use RebuWebApiWeb, :controller
  # alias RebuWebApi.Accounts.{Affiliate, User}
  alias RebuWebApi.Marketplace
  alias RebuWebApi.Accounts.{Affiliate, User}

  def create(conn, %{"review" => review_params}) do
    dbg(review_params)

    reviewer = Guardian.Plug.current_resource(conn)

    reviewer_type =
      case reviewer do
        %Affiliate{} -> "affiliate"
        %User{} -> "user"
      end

    reviewer_id = reviewer.id

    product = Marketplace.get_product!(review_params["product_id"])

    review_params =
      Map.merge(review_params, %{
        "reviewer_id" => reviewer_id,
        "review_params" => reviewer_type,
        "product" => product
      })

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
end
