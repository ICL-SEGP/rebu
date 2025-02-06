# Script for populating the database. You can run it as:
#
#     mix run priv/repo/seeds.exs
#
# Inside the script, you can read and write to any of your
# repositories directly:
#
#     RebuWebApi.Repo.insert!(%RebuWebApi.SomeSchema{})
#
# We recommend using the bang functions (`insert!`, `update!`
# and so on) as they will fail if something goes wrong.

alias RebuWebApi.Repo
alias RebuWebApi.Factory
alias RebuWebApi.Sales.{Offer, Order}

IO.puts("Seeding database...")

# Step 1: Create an Admin User
admin = Factory.insert(:user, email: "admin@example.com", role: :admin, balance: Decimal.new("10000.00"))

IO.puts("Admin created: #{admin.email}")

# Step 2: Create Offers owned by the Admin
offers = Factory.insert_list(10, :offer, user: admin)

IO.puts("Created #{length(offers)} offers for admin.")

# Step 3: Create Multiple Users
users = Factory.insert_list(50, :user)

IO.puts("Created #{length(users)} users.")

# Step 4: Each User Creates Orders Linked to Admin's Offers
Enum.each(users, fn user ->
  Factory.insert_list(3, :order, user: user, offers: [Enum.random(offers)])
end)

IO.puts("Orders created for all users, each linked to an offer by the admin.")
