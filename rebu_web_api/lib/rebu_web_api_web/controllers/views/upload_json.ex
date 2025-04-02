defmodule RebuWebApiWeb.UploadJSON do
  use JsonView

  # define which fields return without modifying
  @fields [:type, :metadata, :url, :owner_id, :owner_type, :key]


  def render("upload.json", %{upload: upload}) do
    render_json(upload, @fields, [], [])
  end
end
