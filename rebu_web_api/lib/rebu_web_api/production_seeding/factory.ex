defmodule RebuWebApi.Factory do
  use ExMachina.Ecto, repo: RebuWebApi.Repo

  alias RebuWebApi.Factory
  alias RebuWebApi.Sales.{Offer, Order}
  alias RebuWebApi.Accounts.User
  alias RebuWebApi.Accounts.Admin

  @password "Password"

  # User Factory
  def user_factory do
    user()
  end

  def user(attrs \\ %{}) do
    merge_attributes(
      %User{
        first_name: Faker.Person.first_name(),
        last_name: Faker.Person.last_name(),
        email: Faker.Internet.free_email(),
        token_balance: Decimal.new("0.0"),
        rescinded_tokens: Decimal.new("0.0"),
        locked_tokens: Decimal.new("0.0"),
        password: @password,
        hashed_password: Bcrypt.hash_pwd_salt(@password),
        role: :user
      },
      attrs
    )
  end

  def admin_factory do
    admin()
  end

  def admin(attrs \\ %{}) do
    merge_attributes(
      %Admin{
        first_name: Faker.Person.first_name(),
        last_name: Faker.Person.last_name(),
        email: Faker.Internet.free_email(),
        revenue: Decimal.new("0.0"),
        token_balance: Decimal.new("0.0"),
        locked_tokens: Decimal.new("0.0"),
        password: @password,
        hashed_password: Bcrypt.hash_pwd_salt(@password),
        role: :user
      },
      attrs
    )
  end

  # Offer Factory
  def offer_factory do
    offer()
  end

  def offer(attrs \\ %{}) do
    merge_attributes(
      %Offer{
        desc: Faker.Lorem.sentence(5),
        affiliate_link: Faker.Internet.url(),
        # Corrected
        rebate_percentage: Decimal.from_float(:rand.uniform() * 10),
        offer_start: Faker.DateTime.backward(10),
        offer_end: Faker.DateTime.forward(30),
        user: build(:user)
      },
      attrs
    )
  end

  # Order Factory
  def order_factory do
    order()
  end

  def order(attrs \\ %{}) do
    merge_attributes(
      %Order{
        status: Enum.random([:in_progress, :refunded, :completed]),
        # Corrected
        total_rebate_amount: Decimal.from_float(:rand.uniform() * 500),
        user: build(:user),
        # Offers need to be associated separately
        offers: []
      },
      attrs
    )
  end
end
