defmodule RebuWebApi.Marketplace do
  @moduledoc """
  The Marketplace context.
  """

  import Ecto.Query, warn: false
  alias RebuWebApi.Repo

  alias RebuWebApi.Marketplace.{Product, Category, Review}
  alias RebuWebApi.Accounts.User
  alias RebuWebApi.Accounts.Affiliate

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
  def get_product!(id), do: Repo.get!(Product, id)

  @doc """
  Creates a product.

  ## Examples

      iex> create_product(%{field: value})
      {:ok, %Product{}}

      iex> create_product(%{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def create_product(attrs \\ %{}) do
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
    |> Ecto.Changeset.put_assoc(:category, attrs["category"])
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
  end

  def get_products_by_user(%Affiliate{} = user) do
    from(o in Product, where: o.seller_id == ^user.id)
    |> Repo.all()
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

      {id, :user} ->
        case Users.get_user(id) do
          nil -> {:error, :user_not_found}
          user -> {:ok, user}
        end

      {id, :affiliate} ->
        case Affiliates.get_affiliate(id) do
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

    update_product(product, %{avg_rating: avg_rating})
  end

  def get_review_count(product_id) do
    Repo.get!(Product, product_id)
    |> Repo.aggregate(:count, "*")
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
end
