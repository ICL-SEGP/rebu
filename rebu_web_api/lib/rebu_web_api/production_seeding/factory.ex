defmodule RebuWebApi.Factory do
  use ExMachina.Ecto, repo: RebuWebApi.Repo

  alias RebuWebApi.Sales.{Offer, Order}
  alias RebuWebApi.Accounts.User

  # User Factory
  def user_factory do
    password = "Password"

    %User{
      first_name: Faker.Person.first_name(),
      last_name: Faker.Person.last_name(),
      email: Faker.Internet.free_email(),
      balance: Decimal.new("0.0"),
      password: password,
      hashed_password: Bcrypt.hash_pwd_salt(password),
      role: :user
    }
  end

  # Offer Factory
  def offer_factory do
    %Offer{
      desc: Faker.Lorem.sentence(5),
      affiliate_link: Faker.Internet.url(),
      # Corrected
      rebate_percentage: Decimal.from_float(:rand.uniform() * 10),
      offer_start: Faker.DateTime.backward(10),
      offer_end: Faker.DateTime.forward(30),
      user: build(:user)
    }
  end

  # Order Factory
  def order_factory do
    %Order{
      status: Enum.random([:in_progress, :refunded, :completed]),
      # Corrected
      total_rebate_amount: Decimal.from_float(:rand.uniform() * 500),
      user: build(:user),
      # Offers need to be associated separately
      offers: []
    }
  end
end
