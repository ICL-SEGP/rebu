defmodule RebuWebApiWeb.JSONHelpers do
  @doc """
  Formats timestamps as ISO8601 strings.
  """
  def format_datetime(nil), do: nil
  def format_datetime(datetime), do: NaiveDateTime.to_iso8601(datetime)

  @doc """
  Converts order status atoms into human-readable strings.
  """
  def transform_status(:in_progress), do: "in_progress"
  def transform_status(:refunded), do: "refunded"
  def transform_status(:completed), do: "completed"
  def transform_status(status), do: to_string(status)

  @doc """
  Standardized error response.
  """
  def error_response(message) do
    %{error: message}
  end

  @doc """
  Serializes an Ecto struct into a JSON-safe map dynamically.
  - Handles associations if preloaded, otherwise ignores them.
  - Excludes Ecto metadata and sensitive fields.
  """
  def serialize_schema(nil), do: nil



  def serialize_schema(%_{} = struct) do
    struct
    |> Map.from_struct()
    |> Map.drop([:__meta__, :password, :hashed_password])
    |> Enum.map(fn
      # Ignore unloaded relationships
      {key, %Ecto.Association.NotLoaded{}} -> {key, nil}
      # Convert decimals
      {key, %Decimal{} = decimal} -> {key, Decimal.to_string(decimal)}
      # Convert dates
      {key, %NaiveDateTime{} = dt} -> {key, format_datetime(dt)}
      {key, value} -> {key, value}
    end)
    |> Enum.into(%{})
  end
end
