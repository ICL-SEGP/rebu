defmodule RebuWebApiWeb.AffiliateJSON do
  alias RebuWebApiWeb.JSONHelpers
  


  def get_users(%{users: users}) do
    %{users: Enum.map(users, &JSONHelpers.serialize_schema/1)}
  end

  def get_orders(%{orders: orders}) do
    Enum.map(orders, &JSONHelpers.serialize_schema/1)
  end

  def get_offers(%{offers: offers}) do
    Enum.map(offers, &JSONHelpers.serialize_schema/1)
  end

  def order(%{order: order}) do
    RebuWebApiWeb.OrderJSON.serialize_order(order)
  end
end
