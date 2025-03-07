defmodule RebuWebApiWeb.CategoryJSON do
  use JsonView

  # define which fields return without modifying
  @fields [
    :name,
    :image_url
  ]
  # define which fields that need to format or calculate, you have to define `render_field/2` below
  @relationships [
    products: RebuWebApiWeb.ProductJSON
  ]

  def render("category.json", %{category: category}) do
    # 1st way if `use JsonView`
    render_json(category, @fields, [], @relationships)
  end

  def render("category.json", %{categories: categories}) do
    # 1st way if `use JsonView`
    JsonView.render_many(categories, __MODULE__, "category.json")
  end
end
