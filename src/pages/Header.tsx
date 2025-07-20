@@ .. @@
                         <Link to="/account" onClick={scrollToTop} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">My Account</Link>
-                        <Link to="/account" onClick={() => { scrollToTop(); setActiveTab('orders'); }} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">My Orders</Link>
+                        <Link to="/account" onClick={scrollToTop} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">My Orders</Link>
                         <button onClick={logout} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Logout</button>
                       </>
                     ) : (
                       <>
                         <Link to="/login" onClick={scrollToTop} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Login</Link>
                         <Link to="/register" onClick={scrollToTop} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Register</Link>
                       </>
                     )}
                   </div>
                 </div>
               </div>