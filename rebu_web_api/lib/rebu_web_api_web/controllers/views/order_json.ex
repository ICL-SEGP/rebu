defmodule RebuWebApiWeb.OrderJSON do
  alias RebuWebApi.Sales.Order
  alias RebuWebApiWeb.JSONHelpers

  @doc """
  Renders a list of orders.
  """
  def index(%{orders: orders}) do
    %{data: Enum.map(orders, &serialize_order/1)}
  end

  @doc """
  Renders a single order.
  """
  def show(%{order: order}) do
    %{data: serialize_order(order)}
  end

  defp serialize_order(%Order{} = order) do
    order_map = JSONHelpers.serialize_schema(order)

    # Handle relationships if preloaded, otherwise return nil
    Map.merge(order_map, %{
      status: JSONHelpers.transform_status(order.status),
      user: JSONHelpers.serialize_schema(order.user),
      offers:
        case order.offers do
          %Ecto.Association.NotLoaded{} -> nil
          _ -> Enum.map(order.offers, &JSONHelpers.serialize_schema/1)
        end
    })
  end
end
