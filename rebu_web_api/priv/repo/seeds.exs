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
    1..2,
    fn _x ->
      {:ok, offer} = Sales.create_offer(Factory.offer(%{admin: admin}))
      offer
    end
  )

IO.puts("Created #{length(offers)} offers for admin.")

# Step 3: Create Multiple Users
users = Factory.insert_list(1, :user)

IO.puts("Created #{length(users)} users.")

# Step 4: Each User Creates Orders Linked to Admin's Offers

Enum.each(users, fn user ->
  Enum.map(1..1, fn _x ->
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

IO.puts("Orders created for all users, each linked to an offer by the admin.")

# offers =
#   Enum.map(
#     1..10,
#     fn _x ->
#       {:ok, offer} = Sales.create_offer(Factory.offer(%{admin: admin, status: :scheduled}))
#       offer
#     end
#   )

IO.puts("Scheduled Future Admin Orders.")

Enum.each(users, fn user ->
  balances = Accounts.calculate_balances!(user)
  Accounts.update_user_balance(user, balances)
end)

IO.puts("Calculated user balances.")

IO.puts("Seeding completed successfully!")
