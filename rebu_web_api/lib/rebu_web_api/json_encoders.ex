# defimpl Jason.Encoder, for: Decimal do
#   def encode(decimal, opts) do
#     decimal
#     |> Decimal.to_string()
#     |> Jason.Encode.string(opts)
#   end
# end
