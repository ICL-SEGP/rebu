defmodule RebuWebApi.Uploads do
  import Ecto.Query, warn: false
  alias RebuWebApi.Repo
  alias RebuWebApi.Uploads.Upload

  def create_upload(attrs \\ %{}) do
    %Upload{}
    |> Upload.changeset(attrs)
    |> Repo.insert()
  end
end
