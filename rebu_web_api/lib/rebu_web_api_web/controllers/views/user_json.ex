defmodule RebuWebApiWeb.UserJSON do
  use JsonView

  # define which fields return without modifying
  @fields [
    :id,
    :first_name,
    :last_name,
    :email,
    :role,
    :solana_pub_key,
    :date_joined,
    :token_balance,
    :blocked
  ]
  # define which fields that need to format or calculate, you have to define `render_field/2` below
  @relationships [
    orders: RebuWebApiWeb.OfferJSON,
    affiliate: RebuWebApiWeb.AffiliateJSON
  ]

  def render("user.json", %{user: user}) do
    render_json(user, @fields, [], @relationships)
  end

  def render("user.json", %{users: users}) do
    # 1st way if `use JsonView`
    JsonView.render_many(users, __MODULE__, "user.json")
  end
end
