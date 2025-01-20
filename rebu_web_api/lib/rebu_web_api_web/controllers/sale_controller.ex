defmodule RebuWebApiWeb.SaleController do
  use RebuWebApiWeb, :controller

  action_fallback RebuWebApiWeb.FallbackController

  # def index(conn, _params) do
  #   sales = Catalog.list_sales()
  #   render(conn, :index, sales: sales)
  # end

  # def create(conn, %{"sale" => sale_params}) do
  #   with {:ok, %Sale{} = sale} <- Catalog.create_sale(sale_params) do
  #     conn
  #     |> put_status(:created)
  #     |> put_resp_header("location", ~p"/api/sales/#{sale}")
  #     |> render(:show, sale: sale)
  #   end
  # end

  # def show(conn, %{"id" => id}) do
  #   sale = Catalog.get_sale!(id)
  #   render(conn, :show, sale: sale)
  # end

  # def update(conn, %{"id" => id, "sale" => sale_params}) do
  #   sale = Catalog.get_sale!(id)

  #   with {:ok, %Sale{} = sale} <- Catalog.update_sale(sale, sale_params) do
  #     render(conn, :show, sale: sale)
  #   end
  # end

  # def delete(conn, %{"id" => id}) do
  #   sale = Catalog.get_sale!(id)

  #   with {:ok, %Sale{}} <- Catalog.delete_sale(sale) do
  #     send_resp(conn, :no_content, "")
  #   end
  # end
end
