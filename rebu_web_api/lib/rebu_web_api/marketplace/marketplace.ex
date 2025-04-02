defmodule RebuWebApi.Marketplace do
  @moduledoc """
  The Marketplace context.
  """

  import Ecto.Query, warn: false
  alias RebuWebApi.Repo

  alias RebuWebApi.Marketplace.{Product, Category, Review, Purchase}
  alias RebuWebApi.Accounts.User
  alias RebuWebApi.Accounts.Affiliate
  alias RebuWebApi.Accounts

  @doc """
  Returns the list of products.

  ## Examples

      iex> list_products()
      [%Product{}, ...]

  """
  def list_products do
    Repo.all(Product)
    |> Repo.preload(:category)
  end

  @doc """
  Gets a single product.

  Raises `Ecto.NoResultsError` if the Product does not exist.

  ## Examples

      iex> get_product!(123)
      %Product{}

      iex> get_product!(456)
      ** (Ecto.NoResultsError)

  """
  def get_product!(id), do: Repo.get!(Product, id) |> Repo.preload(:category)

  @doc """
  Creates a product.

  ## Examples

      iex> create_product(%{field: value})
      {:ok, %Product{}}

      iex> create_product(%{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def create_product(attrs \\ %{}) do
    dbg(attrs)

    %Product{}
    |> Product.changeset(attrs)
    |> Ecto.Changeset.put_assoc(:category, attrs["category"])
    |> Repo.insert()
  end

  @doc """
  Updates a product.

  ## Examples

      iex> update_product(product, %{field: new_value})
      {:ok, %Product{}}

      iex> update_product(product, %{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def update_product(%Product{} = product, attrs) do
    product
    |> Product.changeset(attrs)
    |> maybe_put_category(attrs["category"])
    |> Repo.update()
  end

  defp maybe_put_category(changeset, nil), do: changeset

  defp maybe_put_category(changeset, category_attrs) when is_map(category_attrs) do
    Ecto.Changeset.put_assoc(changeset, :category, category_attrs)
  end

  def mark_expired(%Product{} = product) do
    product
    |> Product.changeset(%{status: :expired})
    |> Repo.update()
  end

  @doc """
  Deletes a product.

  ## Examples

      iex> delete_product(product)
      {:ok, %Product{}}

      iex> delete_product(product)
      {:error, %Ecto.Changeset{}}

  """
  def delete_product(%Product{} = product) do
    Repo.delete(product)
  end

  @doc """
  Returns an `%Ecto.Changeset{}` for tracking product changes.

  ## Examples

      iex> change_product(product)
      %Ecto.Changeset{data: %Product{}}

  """
  def change_product(%Product{} = product, attrs \\ %{}) do
    Product.changeset(product, attrs)
  end

  def get_products_by_user(%User{} = user) do
    from(o in Product, where: o.seller_id == ^user.id)
    |> Repo.all()
    # <--- Preload function on the list
    |> Repo.preload(:category)
  end

  def get_products_by_user(%Affiliate{} = user) do
    from(o in Product, where: o.seller_id == ^user.id)
    |> Repo.all()
    |> Repo.preload(:category)
  end

  def create_category(attrs \\ %{}) do
    %Category{}
    |> Category.changeset(attrs)
    |> Repo.insert()
  end

  def list_categories do
    Repo.all(Category)
  end

  def get_category_by_name(name) do
    Repo.get_by(Category, name: name)
  end

  def get_owner(id, type) do
    case {id, type} do
      {nil, _} ->
        {:error, :owner_id_missing}

      {id, "user"} ->
        case Accounts.get_user!(id) do
          nil -> {:error, :user_not_found}
          user -> {:ok, user}
        end

      {id, "affiliate"} ->
        case Accounts.get_affiliate!(id) do
          nil -> {:error, :affiliate_not_found}
          affiliate -> {:ok, affiliate}
        end

      {_, _} ->
        {:error, :invalid_owner_type}
    end
  end

  def update_avg_rating(product, rating) do
    avg_rating =
      case product.avg_rating do
        nil ->
          rating

        _ ->
          Kernel.round((product.avg_rating + rating) / get_review_count(product.id))
      end

    dbg(avg_rating)

    dbg(update_product(product, %{avg_rating: avg_rating}))
  end

  def get_review_count(product_id) do
    from(review in RebuWebApi.Marketplace.Review,
      where: review.product_id == ^product_id,
      select: count("*")
    )
    |> Repo.one()
  end

  def get_review!(id) do
    Repo.get!(Review, id)
  end

  def get_reviews_for_product(product_id) do
    Repo.get!(Product, product_id)
    |> Repo.preload(:reviews)
  end

  def create_review(attrs \\ %{}) do
    output =
      %Review{}
      |> Review.changeset(attrs)
      |> Ecto.Changeset.put_assoc(:product, attrs["product"])
      |> Repo.insert()

    update_avg_rating(attrs["product"], attrs["rating"])

    output
  end

  def update_review(%Review{} = review, attrs) do
    output =
      review
      |> Review.changeset(attrs)
      |> Ecto.Changeset.put_assoc(:product, attrs["product"])
      |> Repo.update()

    update_avg_rating(attrs["product"], attrs["rating"])

    output
  end

  def create_purchase(attrs \\ %{}) do
    %Purchase{}
    |> Purchase.changeset(attrs)
    |> Ecto.Changeset.put_assoc(:product, attrs.product)
    |> Repo.insert()
  end

  def get_purchases_by_user(user_id) do
    from(p in Purchase,
      where: p.buyer_id == ^user_id,
      # Sort by latest first
      order_by: [desc: p.inserted_at],
      # Preload product details
      preload: [:product]
    )
    |> Repo.all()
  end

  def get_product_with_user_reviews(product_id, user_id) do
    Product
    |> Repo.get(product_id)
    |> Repo.preload(reviews: from(r in Review, where: r.reviewer_id == ^user_id))
  end

  def get_product_with_reviews(product_id) do
    Product
    |> Repo.get(product_id)
    |> Repo.preload(:reviews)
  end

  def get_reviews_by_product_id(product_id) do
    from(r in Review,
      where: r.product_id == ^product_id,
      order_by: [desc: r.inserted_at]
    )
    |> Repo.all()
  end

  def get_reviews_by_product_id_and_user_id(product_id, user_id) do
    from(r in Review,
      where: r.product_id == ^product_id and r.reviewer_id == ^user_id,
      order_by: [desc: r.inserted_at],
      # Optional: preload user information
      preload: [:user]
    )
    |> Repo.all()
  end

  def delete_review(%Review{} = review) do
    Repo.delete(review)
  end
end
