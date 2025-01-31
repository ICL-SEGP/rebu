defmodule RebuWebApi.AccountsTest do
  use RebuWebApi.DataCase

  alias RebuWebApi.Accounts

  describe "users" do
    alias RebuWebApi.Accounts.User

    import RebuWebApi.AccountsFixtures

    @invalid_attrs %{name: nil}

    test "list_users/0 returns all users" do
      user = user_fixture()
      assert Accounts.list_users() == [user]
    end

    test "get_user!/1 returns the user with given id" do
      user = user_fixture()
      assert Accounts.get_user!(user.id) == user
    end

    test "create_user/1 with valid data creates a user" do
      valid_attrs = %{name: "some name"}

      assert {:ok, %User{} = user} = Accounts.create_user(valid_attrs)
      assert user.name == "some name"
    end

    test "create_user/1 with invalid data returns error changeset" do
      assert {:error, %Ecto.Changeset{}} = Accounts.create_user(@invalid_attrs)
    end

    test "update_user/2 with valid data updates the user" do
      user = user_fixture()
      update_attrs = %{name: "some updated name"}

      assert {:ok, %User{} = user} = Accounts.update_user(user, update_attrs)
      assert user.name == "some updated name"
    end

    test "update_user/2 with invalid data returns error changeset" do
      user = user_fixture()
      assert {:error, %Ecto.Changeset{}} = Accounts.update_user(user, @invalid_attrs)
      assert user == Accounts.get_user!(user.id)
    end

    test "delete_user/1 deletes the user" do
      user = user_fixture()
      assert {:ok, %User{}} = Accounts.delete_user(user)
      assert_raise Ecto.NoResultsError, fn -> Accounts.get_user!(user.id) end
    end

    test "change_user/1 returns a user changeset" do
      user = user_fixture()
      assert %Ecto.Changeset{} = Accounts.change_user(user)
    end
  end

  describe "orders" do
    alias RebuWebApi.Accounts.Order

    import RebuWebApi.AccountsFixtures

    @invalid_attrs %{status: nil, total_rebate_amount: nil}

    test "list_orders/0 returns all orders" do
      order = order_fixture()
      assert Accounts.list_orders() == [order]
    end

    test "get_order!/1 returns the order with given id" do
      order = order_fixture()
      assert Accounts.get_order!(order.id) == order
    end

    test "create_order/1 with valid data creates a order" do
      valid_attrs = %{status: :in_progress, total_rebate_amount: "120.5"}

      assert {:ok, %Order{} = order} = Accounts.create_order(valid_attrs)
      assert order.status == :in_progress
      assert order.total_rebate_amount == Decimal.new("120.5")
    end

    test "create_order/1 with invalid data returns error changeset" do
      assert {:error, %Ecto.Changeset{}} = Accounts.create_order(@invalid_attrs)
    end

    test "update_order/2 with valid data updates the order" do
      order = order_fixture()
      update_attrs = %{status: :refunded, total_rebate_amount: "456.7"}

      assert {:ok, %Order{} = order} = Accounts.update_order(order, update_attrs)
      assert order.status == :refunded
      assert order.total_rebate_amount == Decimal.new("456.7")
    end

    test "update_order/2 with invalid data returns error changeset" do
      order = order_fixture()
      assert {:error, %Ecto.Changeset{}} = Accounts.update_order(order, @invalid_attrs)
      assert order == Accounts.get_order!(order.id)
    end

    test "delete_order/1 deletes the order" do
      order = order_fixture()
      assert {:ok, %Order{}} = Accounts.delete_order(order)
      assert_raise Ecto.NoResultsError, fn -> Accounts.get_order!(order.id) end
    end

    test "change_order/1 returns a order changeset" do
      order = order_fixture()
      assert %Ecto.Changeset{} = Accounts.change_order(order)
    end
  end
end
