
import { User } from "../types";

const USERS_KEY = 'fashion_studio_users';
const SESSION_KEY = 'fashion_studio_session';

export class AuthService {
  private static delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Ініціалізація бази користувачів та адміна
  private static getUsers(): User[] {
    let users: User[] = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    // Створюємо адміна, якщо база порожня
    if (users.length === 0) {
      const admin: User = {
        id: 'admin-001',
        email: 'admin@fashion.studio',
        name: 'Owner',
        password: 'Is_2026', // Пароль за замовчуванням
        isPaid: true,
        isAdmin: true,
        uploadCount: 0,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin'
      };
      users = [admin];
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
    }
    return users;
  }

  static async register(email: string, password: string, name: string): Promise<User> {
    await this.delay(800);
    const users = this.getUsers();
    
    if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
      throw new Error("Користувач з таким Email вже існує");
    }

    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      email,
      name,
      password, // Зберігаємо пароль
      isPaid: false,
      isAdmin: false,
      uploadCount: 0,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`
    };

    users.push(newUser);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    localStorage.setItem(SESSION_KEY, JSON.stringify(newUser));
    return newUser;
  }

  static async login(email: string, password: string): Promise<User> {
    await this.delay(600);
    const users = this.getUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (!user) {
      throw new Error("Користувача не знайдено");
    }

    if (user.password !== password) {
      throw new Error("Невірний пароль");
    }

    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    return user;
  }

  static async changePassword(userId: string, oldPass: string, newPass: string): Promise<void> {
    await this.delay(800);
    const users = this.getUsers();
    const index = users.findIndex(u => u.id === userId);
    
    if (index === -1) throw new Error("Користувача не знайдено");
    if (users[index].password !== oldPass) throw new Error("Старий пароль невірний");
    
    users[index].password = newPass;
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    
    // Оновлюємо сесію
    localStorage.setItem(SESSION_KEY, JSON.stringify(users[index]));
  }

  static logout() {
    localStorage.removeItem(SESSION_KEY);
  }

  static getCurrentUser(): User | null {
    const session = localStorage.getItem(SESSION_KEY);
    if (!session) return null;
    
    const sessionUser: User = JSON.parse(session);
    const users = this.getUsers();
    const freshUser = users.find(u => u.id === sessionUser.id);
    return freshUser || null;
  }

  // Збільшення лічильника завантажень
  static async incrementUploadCount(userId: string): Promise<User> {
    const users = this.getUsers();
    const index = users.findIndex(u => u.id === userId);
    if (index === -1) throw new Error("Користувача не знайдено");
    
    users[index].uploadCount += 1;
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    
    const updatedUser = users[index];
    localStorage.setItem(SESSION_KEY, JSON.stringify(updatedUser));
    return updatedUser;
  }

  // --- Admin Methods ---
  static getAllUsers(): User[] {
    return this.getUsers();
  }

  static async updateAnyUserPayment(userId: string, isPaid: boolean): Promise<User> {
    await this.delay(500);
    const users = this.getUsers();
    const index = users.findIndex(u => u.id === userId);
    if (index === -1) throw new Error("User not found");
    
    users[index].isPaid = isPaid;
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    return users[index];
  }
}
