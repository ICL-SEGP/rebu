defmodule RebuWebApiWeb.OrderJSON do
  alias RebuWebApi.Sales.Order

  @doc """
  Renders a list of orders.
  """
  def index(%{orders: orders}) do
    %{data: for(order <- orders, do: data(order))}
  end

  @doc """
  Renders a single order.
  """
  def show(%{order: order}) do
    %{data: data(order)}
  end

  defp data(%Order{} = order) do
    %{
      id: order.id,
      status: order.status,
      total_rebate_amount: order.total_rebate_amount
    }
  end
end
