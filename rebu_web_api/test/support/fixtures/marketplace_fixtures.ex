# defmodule RebuWebApi.MarketplaceFixtures do
#   @moduledoc """
#   This module defines test helpers for creating
#   entities via the `RebuWebApi.Marketplace` context.
#   """

#   @doc """
#   Generate a product.
#   """
#   def product_fixture(attrs \\ %{}) do
#     {:ok, product} =
#       attrs
#       |> Enum.into(%{
#         category: "some category",
#         desc: "some desc",
#         file_size: 42,
#         file_type: "some file_type",
#         file_url: "some file_url",
#         image_urls: "some image_urls",
#         name: "some name",
#         price: "120.5",
#         status: "some status"
#       })
#       |> RebuWebApi.Marketplace.create_product()

#     product
#   end
# end
