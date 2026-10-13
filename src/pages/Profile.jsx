
import { useState } from "react";
import { UserRound, ShieldCheck, Save } from "lucide-react";
import "./Profile.css";

function Profile() {
  const [profile, setProfile] = useState({
    name: "Alex Morgan",
    email: "alex@example.com",
    phone: "",
    age: "",
    bloodGroup: "",
    city: "",
  });

  const [saved, setSaved] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setProfile((previous) => ({
      ...previous,
      [name]: value,
    }));

    setSaved(false);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setSaved(true);
  };

  return (
    <div className="profile-page">
      <div className="profile-heading">
        <div>
          <span className="profile-eyebrow">ACCOUNT SETTINGS</span>
          <h1>My Profile</h1>
          <p>Manage your personal information and health preferences.</p>
        </div>
        <div className="profile-heading-icon">
          <UserRound size={27} />
        </div>
      </div>

      <div className="profile-layout">
        <section className="profile-card profile-summary">
          <div className="profile-avatar">
            <UserRound size={36} />
          </div>

          <h2>{profile.name || "Your Name"}</h2>
          <p>{profile.email || "Your email address"}</p>

          <div className="profile-demo-badge">
            <ShieldCheck size={16} />
            Frontend Demo
          </div>

          <div className="profile-notice">
            <ShieldCheck size={19} />
            <p>
              This prototype stores no profile information on a server.
              Avoid entering real sensitive medical information.
            </p>
          </div>
        </section>

        <section className="profile-card profile-form-card">
          <div className="profile-section-heading">
            <h2>Personal Information</h2>
            <p>Update your details below.</p>
          </div>

          <form onSubmit={handleSubmit} className="profile-form">
            <label>
              Full Name
              <input
                name="name"
                value={profile.name}
                onChange={handleChange}
                placeholder="Enter your name"
                required
              />
            </label>

            <label>
              Email Address
              <input
                type="email"
                name="email"
                value={profile.email}
                onChange={handleChange}
                placeholder="Enter your email"
                required
              />
            </label>

            <label>
              Phone Number
              <input
                type="tel"
                name="phone"
                value={profile.phone}
                onChange={handleChange}
                placeholder="Enter phone number"
              />
            </label>

            <div className="profile-form-row">
              <label>
                Age
                <input
                  type="number"
                  name="age"
                  min="1"
                  max="120"
                  value={profile.age}
                  onChange={handleChange}
                  placeholder="Your age"
                />
              </label>

              <label>
                Blood Group
                <select
                  name="bloodGroup"
                  value={profile.bloodGroup}
                  onChange={handleChange}
                >
                  <option value="">Select group</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </label>
            </div>

            <label>
              City
              <input
                name="city"
                value={profile.city}
                onChange={handleChange}
                placeholder="Enter your city"
              />
            </label>

            {saved && (
              <div className="profile-success">
                Demo profile updated in this page.
              </div>
            )}

            <button type="submit" className="profile-save-button">
              <Save size={17} />
              Save Changes
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}

export default Profile;
