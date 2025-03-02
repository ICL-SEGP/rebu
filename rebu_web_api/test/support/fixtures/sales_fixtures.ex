defmodule RebuWebApi.SalesFixtures do
  @moduledoc """
  This module defines test helpers for creating
  entities via the `RebuWebApi.Sales` context.
  """

  @doc """
  Generate a offer.
  """
  def offer_fixture(attrs \\ %{}) do
    {:ok, offer} =
      attrs
      |> Enum.into(%{
        affiliate_link: "some affiliate_link",
        desc: "some desc",
        offer_end: ~N[2025-01-20 12:08:00],
        offer_start: ~N[2025-01-20 12:08:00],
        rebate_percentage: "120.5"
      })
      |> RebuWebApi.Sales.create_offer()

    offer
  end

  @doc """
  Generate a order.
  """
  def order_fixture(attrs \\ %{}) do
    {:ok, order} =
      attrs
      |> Enum.into(%{
        status: :pending,
        total_rebate_amount: "120.5"
      })
      |> RebuWebApi.Sales.create_order()

    order
  end
end
