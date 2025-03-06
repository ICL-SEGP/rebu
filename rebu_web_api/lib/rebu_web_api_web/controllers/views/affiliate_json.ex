defmodule RebuWebApiWeb.AffiliateJSON do
  use JsonView

  # define which fields return without modifying
  @fields [
    :id,
    :first_name,
    :last_name,
    :email,
    :role,
    :inserted_at,
    :updated_at,
    :solana_pub_key
  ]
  # define which fields that need to format or calculate, you have to define `render_field/2` below
  @relationships [
    offers: RebuWebApiWeb.OfferJSON,
    users: RebuWebApiWeb.UserJSON,
    uploads: RebuWebApWeb.UploadJSON
  ]

  def render("affiliate.json", %{affiliate: affiliate}) do
    # 1st way if `use JsonView`
    render_json(affiliate, @fields, [], @relationships)
  end
end
