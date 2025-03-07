# defmodule RebuWebApi.MarketplaceTest do
#   use RebuWebApi.DataCase

#   alias RebuWebApi.Marketplace

#   describe "products" do
#     alias RebuWebApi.Marketplace.Product

#     import RebuWebApi.MarketplaceFixtures

#     @invalid_attrs %{name: nil, status: nil, desc: nil, category: nil, price: nil, image_urls: nil, file_url: nil, file_type: nil, file_size: nil}

#     test "list_products/0 returns all products" do
#       product = product_fixture()
#       assert Marketplace.list_products() == [product]
#     end

#     test "get_product!/1 returns the product with given id" do
#       product = product_fixture()
#       assert Marketplace.get_product!(product.id) == product
#     end

#     test "create_product/1 with valid data creates a product" do
#       valid_attrs = %{name: "some name", status: "some status", desc: "some desc", category: "some category", price: "120.5", image_urls: "some image_urls", file_url: "some file_url", file_type: "some file_type", file_size: 42}

#       assert {:ok, %Product{} = product} = Marketplace.create_product(valid_attrs)
#       assert product.name == "some name"
#       assert product.status == "some status"
#       assert product.desc == "some desc"
#       assert product.category == "some category"
#       assert product.price == Decimal.new("120.5")
#       assert product.image_urls == "some image_urls"
#       assert product.file_url == "some file_url"
#       assert product.file_type == "some file_type"
#       assert product.file_size == 42
#     end

#     test "create_product/1 with invalid data returns error changeset" do
#       assert {:error, %Ecto.Changeset{}} = Marketplace.create_product(@invalid_attrs)
#     end

#     test "update_product/2 with valid data updates the product" do
#       product = product_fixture()
#       update_attrs = %{name: "some updated name", status: "some updated status", desc: "some updated desc", category: "some updated category", price: "456.7", image_urls: "some updated image_urls", file_url: "some updated file_url", file_type: "some updated file_type", file_size: 43}

#       assert {:ok, %Product{} = product} = Marketplace.update_product(product, update_attrs)
#       assert product.name == "some updated name"
#       assert product.status == "some updated status"
#       assert product.desc == "some updated desc"
#       assert product.category == "some updated category"
#       assert product.price == Decimal.new("456.7")
#       assert product.image_urls == "some updated image_urls"
#       assert product.file_url == "some updated file_url"
#       assert product.file_type == "some updated file_type"
#       assert product.file_size == 43
#     end

#     test "update_product/2 with invalid data returns error changeset" do
#       product = product_fixture()
#       assert {:error, %Ecto.Changeset{}} = Marketplace.update_product(product, @invalid_attrs)
#       assert product == Marketplace.get_product!(product.id)
#     end

#     test "delete_product/1 deletes the product" do
#       product = product_fixture()
#       assert {:ok, %Product{}} = Marketplace.delete_product(product)
#       assert_raise Ecto.NoResultsError, fn -> Marketplace.get_product!(product.id) end
#     end

#     test "change_product/1 returns a product changeset" do
#       product = product_fixture()
#       assert %Ecto.Changeset{} = Marketplace.change_product(product)
#     end
#   end
# end
