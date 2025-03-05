defmodule RebuWebApiWeb.UploadsController do
  use RebuWebApiWeb, :controller
  alias ExAws.S3
  alias RebuWebApi.Uploads

  @file_bucket "rebu-files"
  @image_bucket "rebu-images"

  def gen_presigned_url(conn, %{"type" => "image"} = params) do
    # Ensure filenames are unique (use UUIDs if needed)
    key = Ecto.UUID.generate()
    # Generate the pre-signed PUT URL
    {:ok, url} = get_s3_url(@image_bucket, key, params)

    json(conn, %{url: url, key: key})
  end

  def gen_presigned_url(conn, %{"type" => "file"} = params) do
    # Ensure filenames are unique (use UUIDs if needed)
    key = Ecto.UUID.generate()
    # Generate the pre-signed PUT URL
    {:ok, url} = get_s3_url(@image_bucket, key, params)

    json(conn, %{url: url, key: key})
  end

  defp get_s3_url(bucket, key, %{"content_type" => content_type}) do
    S3.presigned_url(
      ExAws.Config.new(:s3),
      :put,
      bucket,
      key,
      # URL expires in 1 hour
      expires_in: 3600,
      content_type: content_type
    )
  end

  # only for sending files purchased not images
  defp generate_presigned_download_url(file_key) do
    # Generate a signed GET URL that expires in 1 hour
    {:ok, url} =
      S3.presigned_url(
        ExAws.Config.new(:s3),
        :get,
        @file_bucket,
        file_key,
        expires_in: 3600
      )

    url
  end

  def create(conn, %{"upload" => upload_params}) do
    user = Guardian.Plug.current_resource(conn)

    to_merge =
      if Accounts.is_affiliate(user) do
        %{owner_id: user.id, owner_type: :affiliate}
      else
        %{owner_id: user.id, owner_type: :user}
      end

    upload = Uploads.create_upload(Map.merge(upload_params, to_merge))

    conn
    |> put_status(:created)
    |> json(upload)
  end
end
