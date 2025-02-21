defimpl Jason.Encoder, for: Decimal do
  def encode(value, opts) do
    Decimal.to_string(value) |> Jason.Encoder.encode(opts)
  end
end
