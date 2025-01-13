defmodule RebuWebApi.Repo do
  use Ecto.Repo,
    otp_app: :rebu_web_api,
    adapter: Ecto.Adapters.Postgres
end
