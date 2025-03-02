# # Script for populating the database. You can run it as:
# #
# #     mix run priv/repo/seeds.exs
# #
# # Inside the script, you can read and write to any of your
# # repositories directly:
# #
# #     RebuWebApi.Repo.insert!(%RebuWebApi.SomeSchema{})
# #
# # We recommend using the bang functions (`insert!`, `update!`
# # and so on) as they will fail if something goes wrong.

alias RebuWebApi.Repo
alias RebuWebApi.Factory
alias RebuWebApi.Accounts
alias RebuWebApi.Sales.{Offer, Order}
alias RebuWebApi.Sales

IO.puts("Seeding database...")

# Step 1: Create an Affiliate User
affiliate =
  Factory.insert(:affiliate,
    email: "affiliate@test.com",
    role: :affiliate,
    revenue: Decimal.new("10000.00")
  )

IO.puts("affiliate created: #{affiliate.email}")

# Step 2: Create Offers owned by the affiliate

offers =
  Enum.map(
    1..10,
    fn _x ->
      {:ok, offer} =
        Repo.insert(Offer.changeset(%Offer{}, Factory.offer(%{affiliate: affiliate})))

      offer
    end
  )

IO.puts("Created #{length(offers)} offers for affiliate.")

# Step 3: Create Multiple Users
users = Factory.insert_list(2, :user)

users = [Factory.insert(:user, email: "test@test.com") | users]

IO.puts("Created #{length(users)} users.")

# Step 4: Each User Creates Orders Linked to affiliate's Offers

Enum.each(users, fn user ->
  Enum.map(1..8, fn _x ->
    order_params =
      Factory.order(%{
        user: user,
        offers: offers
      })

    case Sales.create_order(order_params) do
      {:ok, order} -> IO.puts("Order #{order.id} created for user #{user.id}.")
      {:error, changeset} -> IO.inspect(changeset.errors, label: "Order creation failed")
    end
  end)
end)

IO.puts("Orders created for all users, each linked to an offer by the affiliate.")

offers =
  Enum.map(
    1..10,
    fn _x ->
      {:ok, offer} =
        Repo.insert(
          Offer.changeset(%Offer{}, Factory.offer(%{affiliate: affiliate, status: :scheduled}))
        )

      offer
    end
  )

IO.puts("Scheduled Future affiliate Orders.")

Enum.each(users, fn user ->
  balances = Accounts.calculate_balances!(user)
  Accounts.update_user_balance(user, balances)
end)

IO.puts("Calculated user balances.")

IO.puts("Seeding completed successfully!")
