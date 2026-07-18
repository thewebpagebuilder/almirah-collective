import re
from pathlib import Path

t = Path('src/app/account/login/page.tsx').read_text()

t = t.replace('import { MagneticButton } from "@/components/ui/magnetic-button";',
              'import { MagneticButton } from "@/components/ui/magnetic-button";\nimport { supabase } from "@/lib/supabase";')

old_submit = r'function onSubmit\(e: React\.FormEvent\) \{.*?router\.push\("/account"\);\n  \}'
new_submit = '''const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (mode === "signup") {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: name },
          },
        });
        if (signUpError) throw signUpError;
        router.push("/account");
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) throw signInError;
        router.push("/account");
      }
    } catch (err: any) {
      setError(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  }'''

t = re.sub(old_submit, new_submit, t, flags=re.DOTALL)

t = t.replace('<MagneticButton type="submit" className="w-full">',
              '{error && <p className="text-red-500 text-xs mb-2 text-center">{error}</p>}\n        <MagneticButton type="submit" className="w-full" disabled={loading}>')

t = t.replace('Demo portal — use the prefilled credentials to view Ameena\\\'s dashboard.',
              'Secure client portal powered by Supabase. Log in to manage your orders, wishlist, and profile.')

Path('src/app/account/login/page.tsx').write_text(t)
print("Login page patched for Supabase Auth.")
