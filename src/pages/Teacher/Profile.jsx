import React, { useState } from "react";
import TeacherLayout from "../../components/TeacherLayout";

export default function Profile(){
  const [profile, setProfile] = useState({ name: "Umm Ayman", email: "umm.ayman@riyadh-bayan.edu", bio: "Teacher of Quran" });

  function save(e){
    e.preventDefault();
    alert("Profile saved");
  }

  return (
    <TeacherLayout>
      <div className="max-w-[800px] mx-auto">
        <h2 className="text-xl font-semibold">Profile</h2>
        <form className="mt-4 space-y-4" onSubmit={save}>
          <div>
            <label className="text-sm">Name</label>
            <input className="w-full border p-2 rounded mt-1" value={profile.name} onChange={(e)=>setProfile({...profile, name: e.target.value})} />
          </div>
          <div>
            <label className="text-sm">Email</label>
            <input className="w-full border p-2 rounded mt-1" value={profile.email} onChange={(e)=>setProfile({...profile, email: e.target.value})} />
          </div>
          <div>
            <label className="text-sm">Bio</label>
            <textarea className="w-full border p-2 rounded mt-1" rows="4" value={profile.bio} onChange={(e)=>setProfile({...profile, bio: e.target.value})}></textarea>
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" className="px-4 py-2 rounded border">Cancel</button>
            <button type="submit" className="px-4 py-2 rounded bg-[var(--primary)] text-white">Save</button>
          </div>
        </form>
      </div>
    </TeacherLayout>
  );
}
