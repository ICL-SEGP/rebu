defmodule RebuWebApiWeb.ReviewJSON do
  use JsonView

  # define which fields return without modifying
  @fields [
    :rating,
    :comment,
    :reviewer_id,
    :reviewer_type
  ]
  # define which fields that need to format or calculate, you have to define `render_field/2` below
  @relationships [
    products: RebuWebApiWeb.ProductJSON
  ]

  def render("review.json", %{review: review}) do
    # 1st way if `use JsonView`
    render_json(review, @fields, [], @relationships)
  end

  def render("review.json", %{reviews: reviews}) do
    # 1st way if `use JsonView`
    JsonView.render_many(reviews, __MODULE__, "review.json")
  end
end
