defmodule RebuWebApiWeb.AdminController do
  use RebuWebApiWeb, :controller

  alias RebuWebApi.Accounts
  alias RebuWebApi.Sales
  alias RebuWebApi.Sales.Order

  action_fallback RebuWebApiWeb.FallbackController

  def get_users(conn, _params) do
    users = Accounts.get_users_by_role(:user)

    conn
    |> put_status(200)
    |> render(:get_users, users: users)
  end

  def get_orders(conn, _params) do
    orders = Sales.list_orders_with_offers()

    conn
    |> put_status(200)
    |> render(:get_orders, orders: orders)
  end

  def stats(conn, _params) do
    balances = Accounts.admin_balances!()
    offer_counts = Sales.get_offer_counts_by_status()
    order_counts = Sales.get_order_counts_by_status()
    monthly_breakdown = Sales.get_monthly_order_stats()
    users_per_month = Accounts.users_joined_per_month()

    conn
    |> put_status(200)
    |> json(%{
      balances: balances,
      offer_counts: offer_counts,
      order_counts: order_counts,
      monthly_breakdown: monthly_breakdown,
      users_per_month: users_per_month
    })
  end

  def update_order(conn, %{
        "id" => id,
        "amount" => amount,
        "date" => date,
        "offers" => offers,
        "status" => status,
        "user" => user
      }) do
    order = Sales.get_order!(id)

    {:ok, order} =
      Sales.update_order(order, %{
        id: id,
        amount: amount,
        date: date,
        offers: offers,
        status: normalize_status(status),
        user: user
      })

    conn
    |> put_status(200)
    |> render(:order, order: order)
  end

  def create_order(conn, %{
        "amount" => amount,
        "date" => date,
        "offers" => offers,
        "status" => status,
        "user" => user
      }) do
    with {:ok, %Order{} = order} <-
           Sales.new_order(%{
             total_rebate_amount: amount,
             date: date,
             offers: offers,
             status: normalize_status(status),
             user: user
           }) do
      conn
      |> put_status(:created)
      |> render(:order, order: order)
    end
  end

  def delete_order(conn, %{"id" => id}) do
    Sales.delete_order(Sales.get_order!(id))

    conn
    |> put_status(:created)
    |> json(%{message: "Order deleted successfully."})
  end

  def normalize_status("in_progress"), do: :in_progress
  def normalize_status("completed"), do: :completed
  def normalize_status("refunded"), do: :refunded
end
