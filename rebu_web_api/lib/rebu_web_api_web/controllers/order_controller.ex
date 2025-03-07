defmodule RebuWebApiWeb.OrderController do
  use RebuWebApiWeb, :controller

  alias RebuWebApi.Accounts
  alias RebuWebApi.Sales
  alias RebuWebApi.Sales.Order
  alias RebuWebApiWeb.ErrorResponse

  action_fallback RebuWebApiWeb.FallbackController

  def get_orders(conn, _params) do
    user = Guardian.Plug.current_resource(conn)
    orders = Sales.get_orders_by_user(user)

    conn
    |> json(orders)
  end

  def create(conn, %{"offer_ids" => offer_ids}) do
    user = Guardian.Plug.current_resource(conn)

    offers = Enum.map(offer_ids, fn id -> Sales.get_offer!(id) end)

    total_rebate_amount = Sales.calculate_total_rebate(offers)

    dbg(total_rebate_amount)

    {:ok, %Order{} = order} =
      Sales.create_order(%{
        offers: offers,
        order_date: Timex.now(),
        status: :completed,
        total_rebate_amount: total_rebate_amount,
        user: user
      })

    {:ok, {}} =
      RebuWebApi.Solana.mint_user(user.solana_pub_key, Kernel.round(total_rebate_amount))

    conn
    |> put_status(:created)
    |> json(order)
  end

  def create(conn, %{"off" => order_params}) do
    with {:ok, %Order{} = order} <- Sales.create_order(order_params) do
      conn
      |> put_status(:created)
      |> json(order)
    end
  end

  def get(conn, %{"id" => id}) do
    user = Guardian.Plug.current_resource(conn)
    order = Sales.get_order!(id)

    if not (order.user_id == user.id) do
      raise ErrorResponse.Unauthorized
    end

    conn
    |> json(order)
  end

  def update(conn, %{"order" => order_params, "id" => id}) do
    user = Guardian.Plug.current_resource(conn)
    order = Sales.get_order!(id)

    if not (order.user_id == user.id) do
      raise ErrorResponse.Unauthorized
    end

    {:ok, order} = Sales.update_order(order, order_params)

    conn
    |> json(order)
  end

  # def create_complete(conn, %{"affiliate_link" => affiliate_link, "order" => order_params}) do
  #   user = Guardian.Plug.current_resource(conn)

  #   offer = Repo.get_by(RebuWebApi.Sales.Offer, affiliate_link: affiliate_link)

  #   if offer do
  #     case Sales.create_complete_order(user, offer, order_params) do
  #       {:ok, %Order{} = order} ->
  #         conn
  #         |> put_status(:created)
  #         |> put_resp_header("location", ~p"/api/orders/#{order.id}")
  #         |> render(:show, order: order)

  #       {:error, changeset} ->
  #         conn
  #         |> put_status(:unprocessable_entity)
  #         |> render(RebuWebApiWeb.ChangesetView, "error.json", changeset: changeset)
  #     end
  #   else
  #     |> put_status(:not_found)
  #     |> json(%{errors: "Offer not found with the provided affiliate link"})
  #   end
  # end

  # def show(conn, %{"id" => id}) do
  #   order = Sales.get_order!(id)
  #   render(conn, :show, order: order)
  # end

  # def update(conn, %{"id" => id, "order" => order_params}) do
  #   order = Sales.get_order!(id)

  #   with {:ok, %Order{} = order} <- Sales.update_order(order, order_params) do
  #     render(conn, :show, order: order)
  #   end
  # end

  # def delete(conn, %{"id" => id}) do
  #   order = Sales.get_order!(id)

  #   with {:ok, %Order{}} <- Sales.delete_order(order) do
  #     send_resp(conn, :no_content, "")
  #   end
  # end

  # new

  def affiliate_get_orders(conn, _params) do
    affiliate = Guardian.Plug.current_resource(conn)

    orders = Sales.get_all_orders_for_affiliate(affiliate.id)

    conn
    |> render("order.json", orders: orders)
  end

  def affiliate_get(conn, %{"id" => id}) do
    affiliate = Guardian.Plug.current_resource(conn)
    order = Sales.get_order!(id)

    if not (order.offer.affiliate_id == affiliate.id) do
      raise ErrorResponse.Unauthorized
    end

    conn
    |> render("order.json", order: order)
  end

  def affiliate_update(conn, %{"id" => id, "order" => order_params}) do
    _affiliate = Guardian.Plug.current_resource(conn)
    order = Sales.get_order!(id)

    dbg(order_params)

    {:ok, order} = Sales.update_order(order, order_params)

    conn
    |> render("order.json", order: order)
  end

  def affiliate_cancel(conn, %{"id" => id}) do
    _affiliate = Guardian.Plug.current_resource(conn)
    order = Sales.get_order!(id)

    {:ok, order} = Sales.update_order(order, %{status: :cancelled})

    conn
    |> render("order.json", order: order)
  end

  def affiliate_create(conn, %{"order" => order_params, "id" => user_id}) do
    affiliate = Guardian.Plug.current_resource(conn)
    user = Accounts.get_user!(user_id)

    if not (user.affiliate_id == affiliate.id) do
      raise ErrorResponse.Unauthorized
    end

    {:ok, order} = Sales.create_order(Map.put(order_params, "user", user), order_params["offers"])

    conn
    |> json(order)
  end

  def affiliate_get_orders_for_user(conn, %{"user_id" => user_id}) do
    affiliate = Guardian.Plug.current_resource(conn)

    {:ok, orders} = Sales.get_all_orders_for_user_for_affiliate(affiliate.id, user_id)

    conn
    |> json(orders)
  end
end
