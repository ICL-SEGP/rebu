defmodule RebuWebApi.CORS do
  import Plug.Conn

  def init(default), do: default

  def call(conn, _opts) do
    conn
    |> put_resp_header("access-control-allow-origin", "http://localhost:3000")
    |> put_resp_header("access-control-allow-methods", "GET, POST, PATCH, PUT, DELETE, OPTIONS")
    |> put_resp_header(
      "access-control-allow-headers",
      "Origin, Content-Type, Accept, Authorization"
    )
    |> put_resp_header("access-control-allow-credentials", "true")
  end
end
