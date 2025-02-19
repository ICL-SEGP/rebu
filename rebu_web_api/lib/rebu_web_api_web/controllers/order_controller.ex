defmodule RebuWebApiWeb.OrderController do
  use RebuWebApiWeb, :controller

  alias RebuWebApi.Accounts
  alias RebuWebApi.Sales
  alias RebuWebApi.Sales.Order

  action_fallback RebuWebApiWeb.FallbackController

  def index(conn, _params) do
    user = Guardian.Plug.current_resource(conn)

    orders =
      if Accounts.is_admin(user) do
        Sales.list_orders()
      else
        Sales.get_orders_by_user(user)
      end

    render(conn, :index, orders: orders)
  end

  def create(conn, %{"order" => order_params}) do
    with {:ok, %Order{} = order} <- Sales.create_order(order_params) do
      conn
      |> put_status(:created)
      |> put_resp_header("location", ~p"/api/orders/#{order}")
      |> render(:show, order: order)
    end
  end

  def create_complete(conn, %{"offer_id" => offer_id, "order" => order_params}) do
    user = Guardian.Plug.current_resource(conn)

    case Sales.create_complete_order(user, %Offer{id: offer_id}, order_params) do
      {:ok, %Order{} = order} ->
        conn
        |> put_status(:created)
        |> put_resp_header("location", ~p"/api/orders/#{order.id}")
        |> render(:show, order: order)

      {:error, changeset} ->
        conn
        |> put_status(:unprocessable_entity)
        |> render(RebuWebApiWeb.ChangesetView, "error.json", changeset: changeset)
    end
  end

  def show(conn, %{"id" => id}) do
    order = Sales.get_order!(id)
    render(conn, :show, order: order)
  end

  def update(conn, %{"id" => id, "order" => order_params}) do
    order = Sales.get_order!(id)

    with {:ok, %Order{} = order} <- Sales.update_order(order, order_params) do
      render(conn, :show, order: order)
    end
  end

  def delete(conn, %{"id" => id}) do
    order = Sales.get_order!(id)

    with {:ok, %Order{}} <- Sales.delete_order(order) do
      send_resp(conn, :no_content, "")
    end
  end
end
