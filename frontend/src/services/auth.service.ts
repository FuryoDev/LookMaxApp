import { auth } from 'boot/firebase.js';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User,
  type UserCredential,
} from 'firebase/auth';

export interface AuthUser {
  uid: string,
  email: string | null,
  displayName: string | null
}

export class AuthService {

  static async signIn(email: string, password: string): Promise<AuthUser> {
    try {
      const result: UserCredential = await signInWithEmailAndPassword(auth, email, password);
      return this.mapFirebaseUser(result.user)
    } catch (error) {
      console.log('Sign in error: ', error);
      throw error;
    }
  }

  static async signUp(email: string, password: string): Promise<AuthUser> {
    try {
      const result: UserCredential = await createUserWithEmailAndPassword(auth, email, password);
      return this.mapFirebaseUser(result.user);
    } catch(error) {
      console.log('Sign in error: ', error);
      throw error;
    }
  }

  static onAuthStateChanged(callback: (user: AuthUser | null) => void):() => void {
    return onAuthStateChanged(auth, (user: User | null) => {
      if(user) {
        callback(this.mapFirebaseUser(user));
      }
      else {
        callback(null);
      }
    })
  }

  static async signOut(): Promise<void> {
    await signOut(auth);
  }

  private static mapFirebaseUser(user: User): AuthUser {
    return {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName
    }
  }

  static async getIdToken(): Promise<string | null> {
    const user = auth.currentUser;
    if(user) {
      try {
        return await user.getIdToken(true);
      }
      catch (error) {
        console.error('Error getting ID token', error);
        return null;
      }
    }
    return null;
  }

  static get currentUser(): AuthUser | null {
    const user = auth.currentUser;
    return user ? this.mapFirebaseUser(user): null;
  }

}
