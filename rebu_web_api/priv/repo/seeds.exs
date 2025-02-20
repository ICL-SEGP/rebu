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

# Step 1: Create an Admin User
admin =
  Factory.insert(:admin,
    email: "admin@example.com",
    role: :admin,
    revenue: Decimal.new("10000.00")
  )

IO.puts("Admin created: #{admin.email}")

# Step 2: Create Offers owned by the Admin
# offers = Factory.insert_list(10, :offer, user: admin)

offers =
  Enum.map(
    1..10,
    fn _x ->
      {:ok, offer} = Sales.create_offer(Factory.offer(%{user: admin}))
      offer
    end
  )

IO.puts("Created #{length(offers)} offers for admin.")

# Step 3: Create Multiple Users
# users = Factory.insert_list(50, :user)
users =
  Enum.map(
    1..50,
    fn _x ->
      {:ok, user} = Accounts.register_user(Factory.user())
      user
    end
  )

IO.puts("Created #{length(users)} users.")

# Step 4: Each User Creates Orders Linked to Admin's Offers
# Enum.each(users, fn user ->
#   Factory.insert_list(3, :order, user: user, offers: [Enum.random(offers)])
# end)

Enum.each(users, fn user ->
  Enum.map(1..3, fn _x ->
    Sales.create_offer(Factory.order(%{user: user, offers: [Enum.random(offers)]}))
  end)
end)

IO.puts("Orders created for all users, each linked to an offer by the admin.")
