fn test(i: &mut u8) -> bool {
    *i += 1;
    *i == 5
}

fn main() {
    let mut i = 1;
    while test(&mut i) {}

    println!("HELLO")
}