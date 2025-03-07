defmodule RebuWebApiWeb.ProductJSON do
  use JsonView

  # define which fields return without modifying
  @fields [
    :id,
    :name,
    :desc,
    :price,
    :image_url,
    :file_url,
    :file_type,
    :file_size,
    :status,
    :category,
    :qty,
    :seller_id,
    :seller_type
  ]
  # define which fields that need to format or calculate, you have to define `render_field/2` below
  @relationships [
    category: RebuWebApiWeb.CategoryJSON
  ]

  def render("product.json", %{product: product}) do
    # 1st way if `use JsonView`
    render_json(product, @fields, [], @relationships)
  end

   def render("product.json", %{products: products}) do
    # 1st way if `use JsonView`
    JsonView.render_many(products, __MODULE__, "product.json")
  end
end
