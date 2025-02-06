# defmodule RebuWebApiWeb.SaleControllerTest do
#   use RebuWebApiWeb.ConnCase

#   import RebuWebApi.CatalogFixtures

#   alias RebuWebApi.Catalog.Sale

#   @create_attrs %{
#     name: "some name",
#     age: 42
#   }
#   @update_attrs %{
#     name: "some updated name",
#     age: 43
#   }
#   @invalid_attrs %{name: nil, age: nil}

#   setup %{conn: conn} do
#     {:ok, conn: put_req_header(conn, "accept", "application/json")}
#   end

#   describe "index" do
#     test "lists all sales", %{conn: conn} do
#       conn = get(conn, ~p"/api/sales")
#       assert json_response(conn, 200)["data"] == []
#     end
#   end

#   describe "create sale" do
#     test "renders sale when data is valid", %{conn: conn} do
#       conn = post(conn, ~p"/api/sales", sale: @create_attrs)
#       assert %{"id" => id} = json_response(conn, 201)["data"]

#       conn = get(conn, ~p"/api/sales/#{id}")

#       assert %{
#                "id" => ^id,
#                "age" => 42,
#                "name" => "some name"
#              } = json_response(conn, 200)["data"]
#     end

#     test "renders errors when data is invalid", %{conn: conn} do
#       conn = post(conn, ~p"/api/sales", sale: @invalid_attrs)
#       assert json_response(conn, 422)["errors"] != %{}
#     end
#   end

#   describe "update sale" do
#     setup [:create_sale]

#     test "renders sale when data is valid", %{conn: conn, sale: %Sale{id: id} = sale} do
#       conn = put(conn, ~p"/api/sales/#{sale}", sale: @update_attrs)
#       assert %{"id" => ^id} = json_response(conn, 200)["data"]

#       conn = get(conn, ~p"/api/sales/#{id}")

#       assert %{
#                "id" => ^id,
#                "age" => 43,
#                "name" => "some updated name"
#              } = json_response(conn, 200)["data"]
#     end

#     test "renders errors when data is invalid", %{conn: conn, sale: sale} do
#       conn = put(conn, ~p"/api/sales/#{sale}", sale: @invalid_attrs)
#       assert json_response(conn, 422)["errors"] != %{}
#     end
#   end

#   describe "delete sale" do
#     setup [:create_sale]

#     test "deletes chosen sale", %{conn: conn, sale: sale} do
#       conn = delete(conn, ~p"/api/sales/#{sale}")
#       assert response(conn, 204)

#       assert_error_sent 404, fn ->
#         get(conn, ~p"/api/sales/#{sale}")
#       end
#     end
#   end

#   defp create_sale(_) do
#     sale = sale_fixture()
#     %{sale: sale}
#   end
# end
